import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Chrome, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useReferral } from "@/hooks/useReferral";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreedToTerms: false
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { applyReferralCode } = useReferral();

// Auto-fill referral code from URL (supports ?ref, ?referral, ?referralCode, ?code) and persist for OAuth
useEffect(() => {
  const keys = ['ref', 'referral', 'referralCode', 'code'];
  let refCode = '';
  for (const k of keys) {
    const val = searchParams.get(k);
    if (val) { refCode = val; break; }
  }
  if (refCode) {
    const sanitized = refCode.trim().toUpperCase();
    setFormData(prev => ({ ...prev, referralCode: sanitized }));
    try { localStorage.setItem('pending_referral_code', sanitized); } catch {}
  }
}, [searchParams]);

  const allowedDomains = ['gmail.com','yahoo.com','yahoo.co.in','yahoo.in','yahoomail.com','outlook.com','hotmail.com','live.com'];
  const signupSchema = z.object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: z.string().trim().email('Invalid email').max(255).refine((val) => {
      const domain = val.toLowerCase().split('@')[1]?.trim();
      return !!domain && allowedDomains.includes(domain);
    }, { message: 'Allowed domains: gmail.com, yahoo.com, yahoomail.com, outlook.com, hotmail.com, live.com' }),
    phone: z.string().trim().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    confirmPassword: z.string().min(6, 'Confirm your password'),
    agreedToTerms: z.boolean().refine(v => v === true, { message: 'Please agree to the Terms of Service' })
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

  const handleSignup = async () => {
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Please fix the errors in the form';
      toast.error(firstError);
      return;
    }

    setLoading(true);
    try {
      // Get referral code from form or localStorage
      const refCode = formData.referralCode.trim() || localStorage.getItem('pending_referral_code') || '';
      
      console.log('🎯 Starting signup with referral code:', refCode);
      
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone
          },
          emailRedirectTo: `${window.location.origin}/user`
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ User created:', data.user.id);
        
        // Apply referral code if present
        if (refCode) {
          console.log('🔗 Applying referral code:', refCode);
          try {
            const success = await applyReferralCode(refCode, data.user.id);
            if (success) {
              console.log('✅ Referral code applied successfully');
              toast.success("Account created with referral code!");
            } else {
              console.log('⚠️ Referral code application failed');
            }
          } catch (refError: any) {
            console.error('❌ Referral error:', refError);
            // Don't block signup if referral fails
          }
          
          // Clear pending referral code
          localStorage.removeItem('pending_referral_code');
        }

        if (data.session) {
          toast.success("Account created! You're logged in.");
          navigate("/user");
        } else {
          toast.success("Account created! Please check your email to verify.");
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

const handleGoogleSignup = async () => {
  try {
    const refCode = formData.referralCode.trim().toUpperCase();
    const base = `${window.location.origin}/user`;
    const redirectTo = refCode ? `${base}?ref=${encodeURIComponent(refCode)}` : base;
    if (refCode) {
      try { localStorage.setItem('pending_referral_code', refCode); } catch {}
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) throw error;
  } catch (error: any) {
    console.error("Google signup error:", error);
    toast.error(error.message || "Failed to sign up with Google");
  }
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
                <Input 
                  id="firstName" 
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="border-gray-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="border-gray-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referralCode" className="text-gray-700">Referral Code (Optional)</Label>
              <Input 
                id="referralCode" 
                placeholder="REF12345678"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value.toUpperCase()})}
                className="border-gray-300 focus:border-green-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password *</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password *</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
              <Checkbox 
                id="terms" 
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreedToTerms: checked as boolean})}
              />
              <Label 
                htmlFor="terms" 
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to the Terms of Service and Privacy Policy *
              </Label>
            </div>

            <Button 
              onClick={handleSignup} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            onClick={handleGoogleSignup}
            disabled={loading}
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