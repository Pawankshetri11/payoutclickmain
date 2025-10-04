import { useState } from "react";
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

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "January 2024",
    bio: "Professional task completer with expertise in digital marketing and content creation."
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully");
  };

  const stats = [
    { label: "Tasks Completed", value: "1,247", icon: Award, color: "text-green-600" },
    { label: "Total Earnings", value: "$2,850", icon: TrendingUp, color: "text-blue-600" },
    { label: "Success Rate", value: "98.5%", icon: Shield, color: "text-purple-600" },
    { label: "Member Since", value: "8 months", icon: Calendar, color: "text-orange-600" }
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
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" />
                  <AvatarFallback className="text-lg md:text-xl font-semibold">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 rounded-full w-7 h-7 md:w-8 md:h-8 p-0"
                  onClick={() => toast.success("Profile picture upload coming soon")}
                >
                  <Camera className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">{profileData.bio}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-success/20 text-success border-success/30 text-xs">Verified</Badge>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Premium</Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                    <span className="truncate">{profileData.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                    {profileData.phone}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 shrink-0" />
                    {profileData.location}
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 text-xs md:text-sm">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={profileData.firstName}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={profileData.lastName}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={profileData.email}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
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
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={profileData.location}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={profileData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
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

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Completed Google Review task", time: "2 hours ago", reward: "+$5.00" },
                    { action: "Submitted app install task", time: "5 hours ago", reward: "+$3.50" },
                    { action: "Completed survey task", time: "1 day ago", reward: "+$8.00" },
                    { action: "Updated profile information", time: "2 days ago", reward: null },
                    { action: "Completed social media task", time: "3 days ago", reward: "+$4.25" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      {activity.reward && (
                        <Badge className="bg-green-100 text-green-800">
                          {activity.reward}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}