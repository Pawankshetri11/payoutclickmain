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
  Upload,
  List
} from "lucide-react";
import { ReviewsModal } from "@/components/admin/ReviewsModal";


const ReviewProfiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProfileOpen, setNewProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    profile_url: "",
    cooldown_minutes: "1440", // profile-level cooldown in minutes
    global_lock_minutes: "60"
  });
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedProfileForReviews, setSelectedProfileForReviews] = useState<any>(null);

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

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Fetched review profiles:', data);
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
      if (!formData.name || !formData.profile_url) {
        toast.error('All fields are required');
        return;
      }

      const { data, error } = await (supabase as any)
        .from('review_profiles')
        .insert([{
          name: formData.name,
          profile_url: formData.profile_url,
          cooldown_minutes: parseInt(formData.cooldown_minutes),
          global_lock_minutes: parseInt(formData.global_lock_minutes),
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Profile created successfully');
      setNewProfileOpen(false);
      resetForm();
      fetchData();
      console.log('Created review profile:', data);
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error(error?.message || 'Failed to create profile');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      profile_url: "",
      cooldown_minutes: "1440", // profile-level cooldown in minutes
      global_lock_minutes: "60"
    });
  };

  const handleUpdateProfile = async () => {
    try {
      if (!selectedProfile || !formData.name || !formData.profile_url) {
        toast.error('Name and Profile URL are required');
        return;
      }

      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({
          name: formData.name,
          profile_url: formData.profile_url,
          cooldown_minutes: parseInt(formData.cooldown_minutes),
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
      toast.error(error?.message || 'Failed to update profile');
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

  const handleToggleStatus = async (id: string, currentIsActive: boolean) => {
    try {
      const newIsActive = !currentIsActive;
      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({ is_active: newIsActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Profile ${newIsActive ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile_url?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center gap-4">
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
                <Label htmlFor="name">Profile Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Amazon Product Review, Restaurant Review"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_url">Profile URL *</Label>
                <Input
                  id="profile_url"
                  placeholder="https://example.com/business"
                  value={formData.profile_url}
                  onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cooldown_minutes">Cooldown (Minutes) *</Label>
                <Input
                  id="cooldown_minutes"
                  type="number"
                  min="1"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData({...formData, cooldown_minutes: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Time in minutes before same user can review this profile again (e.g., 1440 = 24 hours)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="global_lock_minutes">Global Lock (Minutes) *</Label>
                <Input
                  id="global_lock_minutes"
                  type="number"
                  min="1"
                  value={formData.global_lock_minutes}
                  onChange={(e) => setFormData({...formData, global_lock_minutes: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  User-level cooldown after submitting any review for this profile
                </p>
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
                <Label htmlFor="edit-name">Profile Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-profile_url">Profile URL *</Label>
                <Input
                  id="edit-profile_url"
                  value={formData.profile_url}
                  onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cooldown_minutes">Cooldown (Minutes) *</Label>
                <Input
                  id="edit-cooldown_minutes"
                  type="number"
                  min="1"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData({...formData, cooldown_minutes: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Time in minutes before same user can review this profile again (e.g., 1440 = 24 hours)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-global_lock_minutes">Global Lock (Minutes) *</Label>
                <Input
                  id="edit-global_lock_minutes"
                  type="number"
                  min="1"
                  value={formData.global_lock_minutes}
                  onChange={(e) => setFormData({...formData, global_lock_minutes: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  User-level cooldown after submitting any review for this profile
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setEditProfileOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleUpdateProfile}>Update Profile</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
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
                  {profiles.filter(p => p.is_active).length}
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
                  {profiles.filter(p => !p.is_active).length}
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-background/50 border-border/50"
                />
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>Clear</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile Name</TableHead>
                <TableHead>Profile URL</TableHead>
                <TableHead>Review Type</TableHead>
                <TableHead>Cooldown</TableHead>
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
                          <p className="font-medium text-foreground">{profile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatId(profile.id, 'PRF')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={profile.profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        <span className="max-w-[200px] truncate">{profile.profile_url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs">
                        <Clock className="h-3 w-3" />
                        Profile: {profile.cooldown_minutes}m
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit text-xs ml-2">
                        <Clock className="h-3 w-3" />
                        Global: {profile.global_lock_minutes ?? 60}m
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.is_active ? (
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
                            setSelectedProfileForReviews(profile);
                            setReviewsModalOpen(true);
                          }}
                          title="Manage Reviews"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setFormData({
                              name: profile.name,
                              profile_url: profile.profile_url,
                              cooldown_minutes: profile.cooldown_minutes?.toString() || '1440',
                              global_lock_minutes: profile.global_lock_minutes?.toString() || '60'
                            });
                            setEditProfileOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(profile.id, profile.is_active)}
                        >
                          {profile.is_active ? '🔴' : '🟢'}
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

      {/* Reviews Modal */}
      <ReviewsModal
        open={reviewsModalOpen}
        onOpenChange={(open) => {
          setReviewsModalOpen(open);
          if (!open) setSelectedProfileForReviews(null);
        }}
        profile={selectedProfileForReviews ? {
          id: selectedProfileForReviews.id,
          title: selectedProfileForReviews.name
        } : null}
      />
    </div>
  );
};

export default ReviewProfiles;
