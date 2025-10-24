import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {emailSent ? "Check Your Email" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {emailSent 
              ? "We've sent you a password reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {emailSent ? (
            <div className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <CheckCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and click the link to reset your password.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>

              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-border focus:border-primary"
                  required
                  autoFocus
                />
              </div>

              <Button 
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center mt-6">
            <Button 
              variant="link" 
              onClick={() => navigate("/auth")}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
