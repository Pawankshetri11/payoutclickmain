import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatId } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Star,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Image as ImageIcon,
  Upload
} from "lucide-react";

const ReviewProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    review_text: "",
    review_image: "",
    business_link: "",
    profile_lock_hours: "1",
    global_lock_minutes: "30"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('review_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `review-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const handleCreateProfile = async () => {
    try {
      if (!formData.title || !formData.business_link) {
        toast.error('Title and Business Link are required');
        return;
      }

      let imageUrl = formData.review_image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile) || '';
      }

      const { error } = await (supabase as any)
        .from('review_profiles')
        .insert([{
          title: formData.title,
          description: formData.description,
          review_text: formData.review_text,
          review_image: imageUrl,
          business_link: formData.business_link,
          profile_lock_hours: parseInt(formData.profile_lock_hours),
          global_lock_minutes: parseInt(formData.global_lock_minutes),
          status: 'active'
        }]);

      if (error) throw error;

      toast.success('Profile created successfully');
      setNewProfileOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      review_text: "",
      review_image: "",
      business_link: "",
      profile_lock_hours: "1",
      global_lock_minutes: "30"
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleUpdateProfile = async () => {
    try {
      if (!selectedProfile || !formData.title || !formData.business_link) {
        toast.error('Title and Business Link are required');
        return;
      }

      let imageUrl = formData.review_image;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile) || imageUrl;
      }

      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({
          title: formData.title,
          description: formData.description,
          review_text: formData.review_text,
          review_image: imageUrl,
          business_link: formData.business_link,
          profile_lock_hours: parseInt(formData.profile_lock_hours),
          global_lock_minutes: parseInt(formData.global_lock_minutes),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setEditProfileOpen(false);
      setSelectedProfile(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await (supabase as any)
        .from('review_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Profile deleted successfully');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Profile ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            Review Profiles Management
          </h1>
          <p className="text-muted-foreground">Manage profiles for review tasks</p>
        </div>
        <Dialog open={newProfileOpen} onOpenChange={setNewProfileOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Review Profile</DialogTitle>
              <DialogDescription>Add a new profile for users to review</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="title">Profile Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Amazon Product Review, Restaurant Review"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the review profile"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_link">Business Link *</Label>
                <Input
                  id="business_link"
                  placeholder="https://example.com/business"
                  value={formData.business_link}
                  onChange={(e) => setFormData({...formData, business_link: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_text">Review Text (Optional)</Label>
                <Textarea
                  id="review_text"
                  placeholder="Enter the review text that users should post"
                  value={formData.review_text}
                  onChange={(e) => setFormData({...formData, review_text: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_image">Review Image (Optional)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile_lock">Profile Lock (hours)</Label>
                  <Input
                    id="profile_lock"
                    type="number"
                    min="1"
                    value={formData.profile_lock_hours}
                    onChange={(e) => setFormData({...formData, profile_lock_hours: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time before same user can review this profile again
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="global_lock">Global Lock (minutes)</Label>
                  <Input
                    id="global_lock"
                    type="number"
                    min="1"
                    value={formData.global_lock_minutes}
                    onChange={(e) => setFormData({...formData, global_lock_minutes: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cooldown time for all users after someone reviews
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setNewProfileOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleCreateProfile}>Create Profile</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Review Profile</DialogTitle>
              <DialogDescription>Update profile information and review content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Profile Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-business_link">Business Link *</Label>
                <Input
                  id="edit-business_link"
                  value={formData.business_link}
                  onChange={(e) => setFormData({...formData, business_link: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-review_text">Review Text</Label>
                <Textarea
                  id="edit-review_text"
                  value={formData.review_text}
                  onChange={(e) => setFormData({...formData, review_text: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Review Image</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Image
                  </Button>
                  <input
                    id="edit-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {(imagePreview || formData.review_image) && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview || formData.review_image} 
                        alt="Review" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-profile_lock">Profile Lock (hours)</Label>
                  <Input
                    id="edit-profile_lock"
                    type="number"
                    min="1"
                    value={formData.profile_lock_hours}
                    onChange={(e) => setFormData({...formData, profile_lock_hours: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-global_lock">Global Lock (minutes)</Label>
                  <Input
                    id="edit-global_lock"
                    type="number"
                    min="1"
                    value={formData.global_lock_minutes}
                    onChange={(e) => setFormData({...formData, global_lock_minutes: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setEditProfileOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleUpdateProfile}>Update Profile</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Profiles</p>
                <p className="text-xl font-bold text-primary">{profiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Active Profiles</p>
                <p className="text-xl font-bold text-success">
                  {profiles.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-xl font-bold text-info">
                  {profiles.filter(p => p.status === 'inactive').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Filtered</p>
                <p className="text-xl font-bold text-warning">{filteredProfiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Review Profiles</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile Title</TableHead>
                <TableHead>Business Link</TableHead>
                <TableHead>Review Type</TableHead>
                <TableHead>Lock Times</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{profile.title}</p>
                          <p className="text-xs text-muted-foreground">{formatId(profile.id, 'PRF')}</p>
                          {profile.description && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              {profile.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={profile.business_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <span className="max-w-[200px] truncate">{profile.business_link}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {profile.review_image && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            Image
                          </Badge>
                        )}
                        {profile.review_text && (
                          <Badge variant="secondary">Text</Badge>
                        )}
                        {!profile.review_image && !profile.review_text && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs">
                          <Clock className="h-3 w-3" />
                          Profile: {profile.profile_lock_hours}h
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs">
                          <Clock className="h-3 w-3" />
                          Global: {profile.global_lock_minutes}m
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.status === 'active' ? (
                        <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setFormData({
                              title: profile.title,
                              description: profile.description || '',
                              review_text: profile.review_text || '',
                              review_image: profile.review_image || '',
                              business_link: profile.business_link,
                              profile_lock_hours: profile.profile_lock_hours?.toString() || '1',
                              global_lock_minutes: profile.global_lock_minutes?.toString() || '30'
                            });
                            setImagePreview(profile.review_image || '');
                            setEditProfileOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(profile.id, profile.status)}
                        >
                          {profile.status === 'active' ? '🔴' : '🟢'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewProfiles;
