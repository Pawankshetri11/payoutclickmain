import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Mail, Phone, MapPin, Calendar, Edit, Shield, Award, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || ""
      });
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });
      setAvatarUrl(publicUrl);
      toast.success("Profile picture updated successfully");
      refetch();
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    await updateProfile({
      name: profileData.name,
      phone: profileData.phone
    });
    setIsEditing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  const stats = [
    { label: "Tasks Completed", value: profile?.completed_tasks || 0, icon: Award, color: "text-green-600" },
    { label: "Total Earnings", value: `₹${profile?.total_earnings || 0}`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Current Balance", value: `₹${profile?.balance || 0}`, icon: Shield, color: "text-purple-600" },
    { label: "Member Since", value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A", icon: Calendar, color: "text-orange-600" }
  ];

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Manage your personal information and account settings</p>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
              <div className="relative mx-auto sm:mx-0">
                <Avatar className="w-20 h-20 md:w-24 md:h-24">
                  <AvatarImage src={avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} />
                  <AvatarFallback className="text-lg md:text-xl font-semibold">
                    {profile?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                <Button 
                  size="sm" 
                  className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 rounded-full w-7 h-7 md:w-8 md:h-8 p-0"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {profile?.name || "User"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/20 text-success border-success/30 text-xs">
                      {profile?.kyc_status === 'verified' ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      {profile?.level || 'Basic'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                  <span className="truncate">{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                    {profileData.phone || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-2">
                  <div className="text-center md:text-left">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 md:h-8 md:w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Details */}
        <Tabs defaultValue="personal" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs md:text-sm">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </div>
                  <Button 
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  >
                    {isEditing ? "Save Changes" : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={profileData.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email}
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={profileData.phone}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-gray-600">Last changed 2 months ago</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Sessions</h4>
                      <p className="text-sm text-gray-600">Manage your active sessions</p>
                    </div>
                    <Button variant="outline">View Sessions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates about tasks and earnings</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-gray-600">Choose your preferred language</p>
                    </div>
                    <Button variant="outline">English (US)</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Timezone</h4>
                      <p className="text-sm text-gray-600">Set your local timezone</p>
                    </div>
                    <Button variant="outline">EST (UTC-5)</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}