import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Chrome, Users, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("user@payoutclick.com");
  const [password, setPassword] = useState("user123");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Check dummy credentials
    if (email === "user@payoutclick.com" && password === "user123") {
      localStorage.setItem('is_logged_in', 'true');
      toast.success("Login successful! Welcome to PayoutClick");
      navigate("/user");
    } else {
      toast.error("Invalid credentials! Use the demo credentials below.");
    }
  };

  const handleGoogleLogin = () => {
    // Dummy Google login for user
    localStorage.setItem('is_logged_in', 'true');
    toast.success("Login successful! Welcome to PayoutClick");
    navigate("/user");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo Credentials Alert */}
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Demo User Credentials:</strong><br/>
              Email: user@payoutclick.com<br/>
              Password: user123
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-email" className="text-gray-700">Email</Label>
              <Input 
                id="user-email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input 
                  id="user-password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-gray-300 focus:border-blue-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleGoogleLogin}
            className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Button 
                variant="link" 
                onClick={() => navigate("/signup")}
                className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
              >
                Sign up
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}