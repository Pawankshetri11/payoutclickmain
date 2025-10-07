import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatId } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  DollarSign,
  Code,
  Image as ImageIcon,
  Users,
  Trash2,
  Pause,
  Play
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'code' | 'image' | 'image_only' | 'review';
  amount: number;
  vacancy: number;
  completed: number;
  approval_required: boolean;
  review_profiles?: string[];
  created_at: string;
  updated_at: string;
}

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [viewJobModalOpen, setViewJobModalOpen] = useState(false);
  const [editJobModalOpen, setEditJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newJobData, setNewJobData] = useState({
    title: "",
    description: "",
    category: "",
    type: "code" as "code" | "image" | "image_only" | "review",
    amount: "",
    vacancy: "",
    requirements: "",
    submissionLimit: "1",
    reviewProfiles: [] as string[]
  });
  const [reviewProfiles, setReviewProfiles] = useState<any[]>([]);
  const [editJobData, setEditJobData] = useState({
    title: "",
    description: "",
    category: "",
    type: "code" as "code" | "image" | "image_only" | "review",
    amount: "",
    vacancy: "",
    requirements: "",
    submissionLimit: "1",
    reviewProfiles: [] as string[]
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, categoriesRes, profilesRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('job_categories')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true }),
        (supabase as any)
          .from('review_profiles')
          .select('id, name')
          .eq('is_active', true)
          .order('name', { ascending: true })
      ]);

      if (jobsRes.error) throw jobsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (profilesRes.error) throw profilesRes.error;
      
      setJobs(jobsRes.data || []);
      setCategories(categoriesRes.data || []);
      setReviewProfiles(profilesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case "code":
        return <Code className="h-4 w-4 text-primary" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-info" />;
      default:
        return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const generateCodes = (jobId: string, title: string, count: number) => {
    const codes = [];
    const prefix = title.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 3) || 'TAS';
    
    for (let i = 0; i < count; i++) {
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      codes.push({
        job_id: jobId,
        code: `${prefix}${randomNum}`,
        used: false
      });
    }
    
    return codes;
  };

  const handleCreateJob = async () => {
    try {
      if (!newJobData.title || !newJobData.description || !newJobData.amount || !newJobData.vacancy) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (newJobData.type === 'review' && newJobData.reviewProfiles.length === 0) {
        toast.error('Please select at least one review profile');
        return;
      }

      if (!newJobData.title || !newJobData.description || !newJobData.amount || !newJobData.vacancy) {
        toast.error('Please fill in all required fields');
        return;
      }

      const jobData = {
        title: newJobData.title,
        description: newJobData.description,
        category: newJobData.category || 'General',
        type: newJobData.type,
        amount: parseFloat(newJobData.amount),
        vacancy: parseInt(newJobData.vacancy),
        completed: 0,
        status: 'active' as const,
        approval_required: newJobData.type === 'image',
        submission_limit_per_user: parseInt(newJobData.submissionLimit) || 1
      };

      const { data: jobResult, error } = await (supabase as any)
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Job created successfully!');

      setNewJobModalOpen(false);
      setNewJobData({
        title: "",
        description: "",
        category: "",
        type: "code",
        amount: "",
        vacancy: "",
        requirements: "",
        submissionLimit: "1",
        reviewProfiles: []
      });
      fetchJobs();
    } catch (error: any) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  };

  const handleUpdateJob = async () => {
    try {
      if (!selectedJob || !editJobData.title || !editJobData.description || !editJobData.amount || !editJobData.vacancy) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editJobData.type === 'review' && editJobData.reviewProfiles.length === 0) {
        toast.error('Please select at least one review profile');
        return;
      }

      const updatedJobData: any = {
        title: editJobData.title,
        description: editJobData.description,
        category: editJobData.category || 'General',
        type: editJobData.type,
        amount: parseFloat(editJobData.amount),
        vacancy: parseInt(editJobData.vacancy),
        approval_required: editJobData.type === 'image' || editJobData.type === 'image_only',
        submission_limit_per_user: parseInt(editJobData.submissionLimit) || 1
      };

      // Add review_profiles for review type jobs
      if (editJobData.type === 'review') {
        updatedJobData.review_profiles = editJobData.reviewProfiles;
      }

      const { error } = await (supabase as any)
        .from('jobs')
        .update(updatedJobData)
        .eq('id', selectedJob.id);

      if (error) throw error;

      toast.success('Job updated successfully!');
      setEditJobModalOpen(false);
      setSelectedJob(null);
      fetchJobs();
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleArchiveJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to archive this job? Submissions will be preserved.')) {
      return;
    }

    try {
      // Soft-delete: archive the job by setting vacancy to 0 (preserves submissions)
      const { error } = await supabase
        .from('jobs')
        .update({ vacancy: 0 })
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Job archived. Existing submissions are preserved.');
      fetchJobs();
    } catch (error: any) {
      console.error('Error archiving job:', error);
      toast.error('Failed to archive job');
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`);
      fetchJobs();
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-info" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Job Management
          </h1>
          <p className="text-muted-foreground">Manage all jobs and project submissions</p>
        </div>
        <Dialog open={newJobModalOpen} onOpenChange={setNewJobModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Create a new task for users to complete and earn money
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="Enter job title"
                    value={newJobData.title}
                    onChange={(e) => setNewJobData({...newJobData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-category">Category</Label>
                  <Select value={newJobData.category} onValueChange={(val) => setNewJobData({...newJobData, category: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select value={newJobData.type} onValueChange={(val: "code" | "image" | "image_only" | "review") => setNewJobData({...newJobData, type: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code Only (Auto-verify)</SelectItem>
                    <SelectItem value="image">Code + Image (Manual approval)</SelectItem>
                    <SelectItem value="image_only">Image Only (Manual approval)</SelectItem>
                    <SelectItem value="review">Review Task (Auto-verify)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {newJobData.type === 'code' && 'Code tasks are verified automatically with codes.'}
                  {newJobData.type === 'image' && 'Image tasks with code verification require admin approval.'}
                  {newJobData.type === 'image_only' && 'Image-only tasks require admin approval.'}
                  {newJobData.type === 'review' && 'Review tasks show business profiles and verify automatically on completion.'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job-description">Description (HTML supported)</Label>
                <Textarea
                  id="job-description"
                  placeholder="Describe what users need to do. You can use HTML tags like <b>, <i>, <br>, etc."
                  value={newJobData.description}
                  onChange={(e) => setNewJobData({...newJobData, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-amount">Amount (₹)</Label>
                  <Input
                    id="job-amount"
                    type="number"
                    placeholder="0"
                    value={newJobData.amount}
                    onChange={(e) => setNewJobData({...newJobData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-vacancy">Vacancy</Label>
                  <Input
                    id="job-vacancy"
                    type="number"
                    placeholder="0"
                    value={newJobData.vacancy}
                    onChange={(e) => setNewJobData({...newJobData, vacancy: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submission-limit">Submission Limit (Per User)</Label>
                  <Input
                    id="submission-limit"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newJobData.submissionLimit}
                    onChange={(e) => setNewJobData({...newJobData, submissionLimit: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Single submission only, &gt;1 = Multiple submissions allowed
                  </p>
                </div>
              </div>

              {newJobData.type === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="job-requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="job-requirements"
                    placeholder="Clear photo&#10;Good lighting&#10;Product visible"
                    value={newJobData.requirements}
                    onChange={(e) => setNewJobData({...newJobData, requirements: e.target.value})}
                    rows={3}
                  />
                </div>
              )}

              {newJobData.type === "review" && (
                <div className="space-y-2">
                  <Label>Select Review Profiles *</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {reviewProfiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No review profiles available. Create profiles first.</p>
                    ) : (
                      reviewProfiles.map((profile) => (
                        <label key={profile.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newJobData.reviewProfiles.includes(profile.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewJobData({
                                  ...newJobData,
                                  reviewProfiles: [...newJobData.reviewProfiles, profile.id]
                                });
                              } else {
                                setNewJobData({
                                  ...newJobData,
                                  reviewProfiles: newJobData.reviewProfiles.filter(id => id !== profile.id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{profile.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {newJobData.reviewProfiles.length} profile(s)
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setNewJobModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateJob} className="bg-success hover:bg-success/90">
                  Create Job
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Job Modal */}
        <Dialog open={viewJobModalOpen} onOpenChange={setViewJobModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Details</DialogTitle>
              <DialogDescription>
                View job information and details
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <p className="text-sm font-medium">{selectedJob.title}</p>
                    <p className="text-xs text-muted-foreground">{formatId(selectedJob.id, 'JOB')}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p className="text-sm">{selectedJob.category}</p>
                  </div>
                </div>
                
                <div>
                  <Label>Job Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getJobTypeIcon(selectedJob.type)}
                    <span className="capitalize text-sm">{selectedJob.type}</span>
                    {selectedJob.type === 'image' && <Badge variant="outline">Manual Approval</Badge>}
                    {selectedJob.type === 'code' && <Badge variant="outline">Auto Verify</Badge>}
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <div 
                    className="text-sm mt-1 p-3 bg-muted rounded-md"
                    dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm font-medium text-primary">₹{selectedJob.amount}</p>
                  </div>
                  <div>
                    <Label>Vacancy</Label>
                    <p className="text-sm">{selectedJob.vacancy}</p>
                  </div>
                  <div>
                    <Label>Completed</Label>
                    <p className="text-sm">{selectedJob.completed}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setViewJobModalOpen(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewJobModalOpen(false);
                      setEditJobData({
                        title: selectedJob.title,
                        description: selectedJob.description,
                        category: selectedJob.category,
                        type: selectedJob.type,
                        amount: selectedJob.amount.toString(),
                        submissionLimit: (selectedJob as any).submission_limit_per_user?.toString() || "1",
                        vacancy: selectedJob.vacancy.toString(),
                        requirements: "",
                        reviewProfiles: (selectedJob.review_profiles as any) || []
                      });
                      setEditJobModalOpen(true);
                    }}
                  >
                    Edit Job
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Job Modal */}
        <Dialog open={editJobModalOpen} onOpenChange={setEditJobModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update job information and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-job-title">Job Title</Label>
                  <Input
                    id="edit-job-title"
                    placeholder="Enter job title"
                    value={editJobData.title}
                    onChange={(e) => setEditJobData({...editJobData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-job-category">Category</Label>
                  <Select value={editJobData.category} onValueChange={(val) => setEditJobData({...editJobData, category: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                 <Label htmlFor="edit-job-type">Job Type</Label>
                <Select value={editJobData.type} onValueChange={(val: "code" | "image" | "image_only" | "review") => setEditJobData({...editJobData, type: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code">Code Based (Auto-verify)</SelectItem>
                    <SelectItem value="image">Image Based (Manual approval)</SelectItem>
                    <SelectItem value="image_only">Image Only (Manual approval)</SelectItem>
                    <SelectItem value="review">Review Task (Auto-verify)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {editJobData.type === 'code' && 'Code tasks are verified automatically.'}
                  {editJobData.type === 'image' && 'Image tasks require admin approval.'}
                  {editJobData.type === 'image_only' && 'Image-only tasks require admin approval.'}
                  {editJobData.type === 'review' && 'Review tasks show business profiles and verify automatically.'}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-job-description">Description (HTML supported)</Label>
                <Textarea
                  id="edit-job-description"
                  placeholder="Describe what users need to do. You can use HTML tags like <b>, <i>, <br>, etc."
                  value={editJobData.description}
                  onChange={(e) => setEditJobData({...editJobData, description: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-job-amount">Amount (₹)</Label>
                  <Input
                    id="edit-job-amount"
                    type="number"
                    placeholder="0"
                    value={editJobData.amount}
                    onChange={(e) => setEditJobData({...editJobData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-job-vacancy">Vacancy</Label>
                  <Input
                    id="edit-job-vacancy"
                    type="number"
                    placeholder="0"
                    value={editJobData.vacancy}
                    onChange={(e) => setEditJobData({...editJobData, vacancy: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-submission-limit">Submission Limit (Per User)</Label>
                  <Input
                    id="edit-submission-limit"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={editJobData.submissionLimit}
                    onChange={(e) => setEditJobData({...editJobData, submissionLimit: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Single submission only, &gt;1 = Multiple submissions allowed
                  </p>
                </div>
              </div>

              {editJobData.type === "review" && (
                <div className="space-y-2">
                  <Label>Select Review Profiles *</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {reviewProfiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No review profiles available. Create profiles first.</p>
                    ) : (
                      reviewProfiles.map((profile) => (
                        <label key={profile.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editJobData.reviewProfiles.includes(profile.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditJobData({
                                  ...editJobData,
                                  reviewProfiles: [...editJobData.reviewProfiles, profile.id]
                                });
                              } else {
                                setEditJobData({
                                  ...editJobData,
                                  reviewProfiles: editJobData.reviewProfiles.filter(id => id !== profile.id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{profile.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selected: {editJobData.reviewProfiles.length} profile(s)
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditJobModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateJob} className="bg-primary hover:bg-primary/90">
                  Update Job
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Available Jobs</p>
                <p className="text-xl font-bold text-success">
                  {jobs.filter(job => job.vacancy > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Code-based Jobs</p>
                <p className="text-xl font-bold text-primary">
                  {jobs.filter(job => job.type === 'code').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Image-based Jobs</p>
                <p className="text-xl font-bold text-info">
                  {jobs.filter(job => job.type === 'image').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-xl font-bold text-warning">
                  ₹{jobs.reduce((total, job) => total + (job.amount * job.vacancy), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jobs</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-background/50 border-border/50"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : jobs.filter(job => searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.category.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No jobs found. Create your first job to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.filter(job => searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.category.toLowerCase().includes(searchTerm.toLowerCase())).map((job) => (
                      <TableRow key={job.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">#{job.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getJobTypeIcon(job.type)}
                            <span className="capitalize">{job.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-primary">₹{job.amount}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>{job.completed} / {job.vacancy}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all" 
                                style={{ width: `${job.vacancy > 0 ? (job.completed / job.vacancy) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setViewJobModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setEditJobData({
                                  title: job.title,
                                  description: job.description,
                                  category: job.category,
                                  type: job.type,
                                  amount: job.amount.toString(),
                                  vacancy: job.vacancy.toString(),
                                  requirements: "",
                                  submissionLimit: (job as any).submission_limit_per_user?.toString() || "1",
                                  reviewProfiles: (job.review_profiles as any) || []
                                });
                                setEditJobModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.location.href = `/admin/jobs/${job.id}/codes`}
                            >
                              <Code className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleArchiveJob(job.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Archive Job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : jobs.filter(job => (job as any).status === 'active' && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No active jobs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.filter(job => (job as any).status === 'active' && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).map((job) => (
                      <TableRow key={job.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">#{job.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getJobTypeIcon(job.type)}
                            <span className="capitalize">{job.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-primary">₹{job.amount}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>{job.completed} / {job.vacancy}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all" 
                                style={{ width: `${job.vacancy > 0 ? (job.completed / job.vacancy) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setViewJobModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setEditJobData({
                                  title: job.title,
                                  description: job.description,
                                  category: job.category,
                                  type: job.type,
                                  amount: job.amount.toString(),
                                  vacancy: job.vacancy.toString(),
                                  requirements: "",
                                  submissionLimit: (job as any).submission_limit_per_user?.toString() || "1",
                                  reviewProfiles: (job.review_profiles as any) || []
                                });
                                setEditJobModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleStatus(job.id, 'active')}
                              title="Pause Job"
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleArchiveJob(job.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Archive Job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="paused" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : jobs.filter(job => (job as any).status === 'paused' && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No paused jobs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.filter(job => (job as any).status === 'paused' && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).map((job) => (
                      <TableRow key={job.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">#{job.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getJobTypeIcon(job.type)}
                            <span className="capitalize">{job.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-primary">₹{job.amount}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>{job.completed} / {job.vacancy}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-primary h-1.5 rounded-full transition-all" 
                                style={{ width: `${job.vacancy > 0 ? (job.completed / job.vacancy) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setViewJobModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleToggleStatus(job.id, 'paused')}
                              title="Activate Job"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleArchiveJob(job.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Archive Job"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Reward</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading jobs...
                      </TableCell>
                    </TableRow>
                  ) : jobs.filter(job => job.completed >= job.vacancy && job.vacancy > 0 && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No completed jobs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.filter(job => job.completed >= job.vacancy && job.vacancy > 0 && (searchTerm === '' || job.title.toLowerCase().includes(searchTerm.toLowerCase()))).map((job) => (
                      <TableRow key={job.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{job.title}</p>
                            <p className="text-sm text-muted-foreground">#{job.id.substring(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getJobTypeIcon(job.type)}
                            <span className="capitalize">{job.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.category}</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-primary">₹{job.amount}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3" />
                              <span>{job.completed} / {job.vacancy}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div 
                                className="bg-success h-1.5 rounded-full transition-all" 
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedJob(job);
                                setViewJobModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;