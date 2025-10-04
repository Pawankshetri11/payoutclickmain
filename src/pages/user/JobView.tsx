import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Code, 
  Image as ImageIcon,
  CheckCircle,
  Calendar,
  DollarSign,
  Star,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function JobView() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [userEarnings, setUserEarnings] = useState({
    fromThisJob: 0,
    totalEarnings: 1250, // Mock total - would come from user's profile
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      
      if (jobData) {
        setJob({
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          type: jobData.type,
          amount: jobData.amount,
          vacancy: jobData.vacancy,
          completed: jobData.completed,
          status: jobData.status,
          created_at: jobData.created_at,
          requirements: jobData.type === 'image' ? 
            ["Clear photo required", "Good lighting", "Follow instructions"] : 
            ["Follow instructions carefully", "Use provided codes"],
        });

        // Mock user earnings calculation for this job
        // In real app, this would query user's task submissions
        const mockCompletedTasks = Math.floor(Math.random() * 5) + 1;
        setUserEarnings({
          fromThisJob: mockCompletedTasks * jobData.amount,
          totalEarnings: 1250,
          completedTasks: mockCompletedTasks,
        });
      }
    } catch (error: any) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate("/user/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = () => {
    navigate(`/user/tasks/${job.id}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "paused":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Paused</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/user/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            {getStatusBadge(job.status)}
          </div>
          <p className="text-muted-foreground">Earn ₹{job.amount} per completion</p>
        </div>
        <Button 
          onClick={handleStartTask} 
          disabled={job.status !== 'active'}
          className="bg-gradient-primary hover:opacity-90"
        >
          Start This Job
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
              
              {/* Job Info */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                <Badge variant="outline" className={getDifficultyColor("Easy")}>
                  Easy
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {job.type === "code" ? <Code className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {job.type === "code" ? "Code Task" : "Image + Code Task"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  15 min average
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Online
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(job.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Requirements & Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Your Earnings from This Job */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">₹{userEarnings.fromThisJob}</div>
                  <p className="text-sm text-muted-foreground">Earned from this job</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">{userEarnings.completedTasks}</div>
                  <p className="text-sm text-muted-foreground">Tasks completed</p>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="text-2xl font-bold text-accent">₹{userEarnings.totalEarnings}</div>
                  <p className="text-sm text-muted-foreground">Total earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Reward */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Reward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-success">₹{job.amount}</div>
                <p className="text-sm text-muted-foreground">per completion</p>
              </div>
            </CardContent>
          </Card>

          {/* Job Statistics */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Job Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spots</span>
                <span className="font-bold text-foreground">{job.vacancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-primary">{job.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-bold text-warning">{job.vacancy - job.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-bold text-success">
                  {job.vacancy > 0 ? Math.round((job.completed / job.vacancy) * 100) : 0}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-muted-foreground">{job.completed}/{job.vacancy}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.vacancy > 0 ? (job.completed / job.vacancy) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Info */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="w-full justify-center py-2">
                {job.category || 'General'}
              </Badge>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-gradient-card border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                • Read instructions carefully before starting
              </p>
              <p className="text-muted-foreground">
                • {job.type === 'code' ? 'Enter codes exactly as provided' : 'Take clear, well-lit photos'}
              </p>
              <p className="text-muted-foreground">
                • Submit within the time limit
              </p>
              <p className="text-muted-foreground">
                • Contact support if you need help
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}