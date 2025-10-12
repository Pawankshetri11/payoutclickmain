import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Image as ImageIcon, 
  Upload, 
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: number;
    title: string;
    type: "code" | "image";
    reward: number;
    description: string;
    requirements: string[];
    status?: "pending" | "approved" | "rejected";
  };
}

export function JobImageModal({ open, onOpenChange, job }: JobImageModalProps) {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (validImages.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only images under 5MB are allowed",
        variant: "destructive"
      });
    }
    
    setSelectedImages(prev => [...prev, ...validImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmission = async () => {
    if (selectedImages.length === 0) {
      toast({
        title: "No images selected",
        description: "Please upload at least one image to submit your task",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: "Task Submitted Successfully!",
      description: "Your submission is now under review. You'll be notified once it's approved.",
      className: "bg-success/10 text-success border-success/20"
    });

    setSelectedImages([]);
    setDescription("");
    setIsSubmitting(false);
    setUploadProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {job.title}
          </DialogTitle>
          <DialogDescription>
            Upload images to complete this task and earn ₹{job.reward}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{job.description}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  ₹{job.reward} reward
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Admin approval required
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Image submission
                </Badge>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="space-y-1">
                  {job.requirements?.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Upload your images</h3>
                <p className="text-muted-foreground mb-4">
                  Drag & drop images here, or click to select files
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button asChild variant="outline">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Select Images
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum 5 images, 5MB each
                </p>
              </div>

              {/* Selected Images */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Images ({selectedImages.length}/5)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="task-description">Additional Description (Optional)</Label>
                <Textarea
                  id="task-description"
                  placeholder="Add any additional information about your submission..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Upload Progress */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmission}
                disabled={selectedImages.length === 0 || isSubmitting}
                className="w-full bg-success hover:bg-success/90"
              >
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </Button>

              {/* Info */}
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-info mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-medium text-info">Review Process</h4>
                    <p className="text-info/80 mt-1">
                      Your submission will be reviewed by our admin team. This typically takes 2-4 hours. 
                      You'll be notified once your task is approved and the reward is credited to your account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}