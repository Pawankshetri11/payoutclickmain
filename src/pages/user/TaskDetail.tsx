import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Code, 
  Image as ImageIcon,
  CheckCircle,
  Upload,
  AlertCircle
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { submitTask } = useTasks();
  
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedCode, setSubmittedCode] = useState("");
  const [submittedImage, setSubmittedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    
    try {
      // Fetch job details from Supabase
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      
      if (jobData) {
        setTask({
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          type: jobData.type,
          amount: jobData.amount,
          vacancy: jobData.vacancy,
          completed: jobData.completed,
          requirements: jobData.type === 'image' ? ["Clear photo required", "Good lighting"] : ["Follow instructions carefully"]
        });
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task details');
      navigate("/user/tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    if (!task || !code.trim()) {
      setCodeVerified(false);
      return;
    }

    try {
      // job_codes table needs to be created in database
      // For now, verification is disabled until table exists
      setCodeVerified(false);
      toast.error("Code verification unavailable - job_codes table not created yet");
    } catch (error: any) {
      console.error('Error verifying code:', error);
      setCodeVerified(false);
      toast.error("Unable to verify code");
    }
  };

  const handleCodeChange = (value: string) => {
    setSubmittedCode(value);
    if (value.trim()) {
      verifyCode(value);
    } else {
      setCodeVerified(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubmittedImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    // Validate based on task type
    if (task.type === 'code' && (!submittedCode.trim() || !codeVerified)) {
      toast.error("Please enter a valid verified code");
      return;
    }

    if (task.type === 'image' && (!submittedCode.trim() || !codeVerified || !submittedImage)) {
      toast.error("Please provide both verified code and image");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      
      // Upload image if provided
      if (submittedImage) {
        const fileExt = submittedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-submissions')
          .upload(fileName, submittedImage);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('task-submissions')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      // Mock code usage tracking - would be implemented with job_codes table
      console.log('Code marked as used:', submittedCode.trim());

      // Submit task
      await submitTask(task.id, task.amount, {
        code: submittedCode.trim(),
        image: imageUrl
      });

      toast.success("Task submitted successfully!");
      navigate("/user/tasks");
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error("Failed to submit task");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/user/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{task.title}</h1>
          <p className="text-muted-foreground mt-1">Complete this task to earn ₹{task.amount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="text-foreground"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
              
              {/* Task Info */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getDifficultyColor("Easy")}>
                  Easy
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  {task.type === "code" ? <Code className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                  {task.type === "code" ? "Code Task" : "Image + Code Task"}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  15 min
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Online
                </Badge>
              </div>

              {/* Requirements */}
              {task.requirements && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {task.requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Code Input */}
              <div className="space-y-2">
                <Label htmlFor="code">Task Code *</Label>
                <div className="relative">
                  <Input
                    id="code"
                    placeholder="Enter the task code"
                    value={submittedCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={codeVerified ? "border-green-500" : submittedCode ? "border-red-500" : ""}
                  />
                  {submittedCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {codeVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {submittedCode && !codeVerified && (
                  <p className="text-sm text-red-500">Invalid or already used code</p>
                )}
                {codeVerified && (
                  <p className="text-sm text-green-500">Code verified successfully!</p>
                )}
              </div>

              {/* Image Upload for image tasks */}
              {task.type === 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('image')?.click()}
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                          <Button 
                            variant="outline"
                            onClick={() => document.getElementById('image')?.click()}
                          >
                            Choose Image
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload your task completion image
                        </p>
                      </div>
                    )}
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {task.type === 'code' 
                    ? "Code tasks are verified automatically and earnings are credited immediately."
                    : "Image + Code tasks require admin approval after code verification."
                  }
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !codeVerified || (task.type === 'image' && !submittedImage)}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Reward</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">₹{task.amount}</div>
                <p className="text-sm text-muted-foreground">per completion</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spots</span>
                <span className="font-medium">{task.vacancy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{task.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{task.vacancy - task.completed}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}