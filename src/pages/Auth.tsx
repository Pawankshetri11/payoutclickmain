import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Chrome, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "user@payoutclick.com",
    password: "user123",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const email = formData.email.trim();
        const password = formData.password.trim();

        // Demo login bypass
        if (email === "user@payoutclick.com" && password === "user123") {
          localStorage.setItem("is_logged_in", "true");
          toast.success("Demo login successful!");
          navigate("/user");
          return;
        }

        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast.success("Successfully logged in!");
        navigate("/user");
      } else {
        if (!formData.name.trim()) {
          toast.error("Please enter your name");
          return;
        }
        
        const { error } = await signUp(formData.email.trim(), formData.password.trim(), formData.name.trim());
        if (error) throw error;
        
        toast.success("Account created! Please check your email to verify.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? "Sign in to your account" : "Sign up to get started"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-border focus:border-primary"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-border focus:border-primary pl-10"
                  required
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-border focus:border-primary"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-border focus:border-primary pl-10 pr-10"
                  required
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            </div>

            {!isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label 
                  htmlFor="terms" 
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-4 border-border text-foreground hover:bg-accent"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                className="p-0 h-auto font-medium text-primary hover:text-primary/80"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}