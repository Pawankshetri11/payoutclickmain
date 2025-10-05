import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Code, 
  RefreshCw, 
  CheckCircle,
  Users,
  Clock,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJobCodes } from "@/hooks/useJobCodes";
import { useAuth } from "@/contexts/AuthContext";

interface JobCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: number;
    title: string;
    type: "code" | "image";
    vacancies: number;
    reward: number;
    description: string;
    codes?: string[];
    usedCodes?: string[];
  };
}

export function JobCodeModal({ open, onOpenChange, job }: JobCodeModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [userCode, setUserCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { codes, verifyCode } = useJobCodes(job.id.toString());

  const unusedCodes = codes.filter(code => !code.used);
  const availableCount = unusedCodes.length;

  const handleCodeVerification = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify codes",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    const result = await verifyCode(userCode.toUpperCase(), user.id);
    
    if (result?.success) {
      setUserCode("");
      onOpenChange(false);
    }
    
    setIsVerifying(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {job.title}
          </DialogTitle>
          <DialogDescription>
            Complete the task and enter the verification code to earn ₹{job.reward}
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
                  <Users className="h-3 w-3" />
                  {availableCount} / {job.vacancies} available
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Code-based verification
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Code Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Task Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-info mt-0.5" />
                  <div>
                    <h4 className="font-medium text-info">How to complete this task:</h4>
                    <ol className="text-sm text-info/80 mt-2 space-y-1 list-decimal list-inside">
                      <li>Complete the required task as described above</li>
                      <li>You will receive a verification code upon completion</li>
                      <li>Enter the code below to verify your completion</li>
                      <li>Your reward will be automatically credited to your account</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Enter Verification Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="verification-code"
                    placeholder="Enter your verification code"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg"
                    maxLength={6}
                  />
                  <Button 
                    onClick={handleCodeVerification}
                    disabled={userCode.length !== 6 || isVerifying}
                    className="bg-success hover:bg-success/90"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
}