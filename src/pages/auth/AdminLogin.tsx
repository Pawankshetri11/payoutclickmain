import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Chrome, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@payoutclick.com");
  const [password, setPassword] = useState("admin123");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === "admin@payoutclick.com" && password === "admin123") {
      localStorage.setItem("is_admin", "true");
      toast.success("Logged in as admin");
      navigate("/admin");
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  const handleGoogleLogin = () => {
    // Dummy Google login for admin
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Access administrative controls and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email" className="text-gray-700">Admin Email</Label>
              <Input 
                id="admin-email" 
                type="email" 
                placeholder="admin@payoutclick.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-gray-700">Password</Label>
              <div className="relative">
                 <Input 
                   id="admin-password" 
                   type={showPassword ? "text" : "password"}
                   placeholder="admin123"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="border-gray-300 focus:border-red-500 pr-10"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Sign In as Admin
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

           <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
             <p className="text-sm text-amber-800 font-medium">Default Admin Credentials:</p>
             <p className="text-xs text-amber-700 mt-1">Email: admin@payoutclick.com</p>
             <p className="text-xs text-amber-700">Password: admin123</p>
           </div>

           <div className="text-center mt-6">
             <p className="text-sm text-gray-600">
               Need user access?{" "}
                <Button 
                  variant="link" 
                  onClick={() => navigate("/auth")}
                  className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                >
                  User Login
                </Button>
             </p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}