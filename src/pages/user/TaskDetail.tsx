import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useJobCodes } from "@/hooks/useJobCodes";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitTask } = useTasks();
  const { verifyCode: verifyJobCode } = useJobCodes(taskId);
  
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedCode, setSubmittedCode] = useState("");
  const [submittedImage, setSubmittedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [verificationReward, setVerificationReward] = useState<number>(0);

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

  const handleCodeChange = (value: string) => {
    setSubmittedCode(value.toUpperCase());
    setCodeVerified(false);
    setVerificationReward(0);
  };

  const handleVerifyCode = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!submittedCode.trim()) {
      toast.error("Please enter a code");
      return;
    }

    try {
      const result = await verifyJobCode(submittedCode, user.id);
      
      if (result?.success) {
        setCodeVerified(true);
        setVerificationReward(result.reward || 0);
        
        // For code-only tasks, navigate back immediately
        if (task?.type === 'code') {
          setTimeout(() => {
            navigate("/user/tasks");
          }, 2000);
        }
      } else {
        setCodeVerified(false);
      }
    } catch (error: any) {
      console.error('Error verifying code:', error);
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

    // For code tasks, verification already credited the amount
    if (task.type === 'code') {
      toast.error("Code task already completed");
      return;
    }

    // For image tasks, need code verification and image
    if (task.type === 'image') {
      if (!codeVerified || !submittedImage) {
        toast.error("Please verify code and upload image");
        return;
      }
    }

    // For image_only and review tasks, only image is required
    if ((task.type === 'image_only' || task.type === 'review') && !submittedImage) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      // Upload image
      const fileExt = submittedImage.name.split('.').pop();
      const fileName = `${user.id}/${task.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(fileName, submittedImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload image');
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;

      // Submit task for admin review
      await submitTask(task.id, task.amount, {
        code: task.type === 'image' ? submittedCode.trim() : undefined,
        image: imageUrl
      });

      toast.success("Task submitted for review!");
      navigate("/user/my-tasks");
    } catch (error: any) {
      console.error('Error submitting task:', error);
      toast.error(error.message || "Failed to submit task");
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
                  {task.type === "code" 
                    ? "Code Task" 
                    : task.type === "image"
                    ? "Image + Code Task"
                    : task.type === "image_only"
                    ? "Image Only Task"
                    : "Review Task"
                  }
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
              {/* Code Input - Only for code and image tasks */}
              {(task.type === 'code' || task.type === 'image') && (
                <div className="space-y-2">
                  <Label htmlFor="code">Task Code *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="code"
                        placeholder="Enter the task code"
                        value={submittedCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className={codeVerified ? "border-green-500" : ""}
                        disabled={codeVerified}
                        maxLength={10}
                      />
                      {codeVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleVerifyCode}
                      disabled={!submittedCode.trim() || codeVerified}
                      variant={codeVerified ? "outline" : "default"}
                    >
                      {codeVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>
                  {codeVerified && (
                    <Alert className="bg-success/10 border-success/20">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <AlertDescription className="text-success">
                        Code verified! ₹{verificationReward} {task?.type === 'code' ? 'credited to your account' : 'will be credited after image approval'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Image Upload for image, image_only, and review tasks */}
              {(task.type === 'image' || task.type === 'image_only' || task.type === 'review') && (
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
                    : task.type === 'image'
                    ? "Image + Code tasks: Code must be verified first, then upload image for admin approval."
                    : "Image-only tasks: Upload an image for admin approval to earn."
                  }
                </AlertDescription>
              </Alert>

              {/* Submit button for image, image_only, and review tasks */}
              {(task.type === 'image' || task.type === 'image_only' || task.type === 'review') && (
                <Button 
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || 
                    !submittedImage || 
                    (task.type === 'image' && !codeVerified)
                  }
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Review"}
                </Button>
              )}
              
              {task.type === 'code' && codeVerified && (
                <Alert className="bg-success/10 border-success/20">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success font-medium">
                    Task completed! Redirecting...
                  </AlertDescription>
                </Alert>
              )}
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