import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          toast.error("Invalid or expired reset link");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim()
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      
      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Invalid Reset Link</CardTitle>
            <CardDescription className="text-muted-foreground">
              This password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="border-destructive/20 bg-destructive/5 mb-4">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-foreground">
                The reset link may have expired or already been used. Please request a new one.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>

            <div className="text-center mt-4">
              <Button 
                variant="link" 
                onClick={() => navigate("/auth")}
                className="text-primary hover:text-primary/80"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Reset Your Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">New Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border focus:border-primary pr-10"
                  required
                  minLength={6}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm New Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border focus:border-primary pr-10"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Button 
              variant="link" 
              onClick={() => navigate("/auth")}
              className="text-primary hover:text-primary/80"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
