import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Chrome, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const navigate = useNavigate();

  const handleSignup = (type: "user" | "admin") => {
    // Dummy signup - redirect to respective dashboard
    if (type === "admin") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  const handleGoogleSignup = (type: "user" | "admin") => {
    // Dummy Google signup
    handleSignup(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Sign up to get started with our platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={userType === "user" ? "default" : "outline"}
              onClick={() => setUserType("user")}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              User
            </Button>
            <Button
              variant={userType === "admin" ? "default" : "outline"}
              onClick={() => setUserType("admin")}
              className="flex-1"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                className="border-gray-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                className="border-gray-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="border-gray-300 focus:border-green-500 pr-10"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="border-gray-300 focus:border-green-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label 
                htmlFor="terms" 
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>

            <Button 
              onClick={() => handleSignup(userType)} 
              className={`w-full ${
                userType === "admin" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              Create {userType === "admin" ? "Admin" : "User"} Account
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
            onClick={() => handleGoogleSignup(userType)}
            className="w-full mt-4 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Button 
                variant="link" 
                onClick={() => navigate("/login")}
                className="p-0 h-auto font-medium text-green-600 hover:text-green-800"
              >
                Sign in
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}