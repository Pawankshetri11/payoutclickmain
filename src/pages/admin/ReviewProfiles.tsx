import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  Clock
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
    name: "",
    profile_url: "",
    category_id: "",
    cooldown_hours: "24"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, categoriesRes] = await Promise.all([
        (supabase as any)
          .from('review_profiles')
          .select('*, job_categories(name)')
          .order('created_at', { ascending: false }),
        (supabase as any)
          .from('job_categories')
          .select('*')
          .eq('is_active', true)
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProfiles(profilesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    try {
      if (!formData.name || !formData.profile_url) {
        toast.error('Name and URL are required');
        return;
      }

      const { error } = await (supabase as any)
        .from('review_profiles')
        .insert([{
          name: formData.name,
          profile_url: formData.profile_url,
          category_id: formData.category_id || null,
          cooldown_hours: parseInt(formData.cooldown_hours)
        }]);

      if (error) throw error;

      toast.success('Profile created successfully');
      setNewProfileOpen(false);
      setFormData({ name: "", profile_url: "", category_id: "", cooldown_hours: "24" });
      fetchData();
    } catch (error: any) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!selectedProfile || !formData.name || !formData.profile_url) {
        toast.error('Name and URL are required');
        return;
      }

      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({
          name: formData.name,
          profile_url: formData.profile_url,
          category_id: formData.category_id || null,
          cooldown_hours: parseInt(formData.cooldown_hours)
        })
        .eq('id', selectedProfile.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setEditProfileOpen(false);
      setSelectedProfile(null);
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('review_profiles')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Profile ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Amazon Product X, Restaurant Y"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Profile URL</Label>
                <Input
                  id="url"
                  placeholder="https://..."
                  value={formData.profile_url}
                  onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cooldown">Global Cooldown (hours)</Label>
                <Input
                  id="cooldown"
                  type="number"
                  placeholder="24"
                  value={formData.cooldown_hours}
                  onChange={(e) => setFormData({...formData, cooldown_hours: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  Time before this profile is available again for all users
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewProfileOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProfile}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Review Profile</DialogTitle>
              <DialogDescription>Update profile information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Profile Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-url">Profile URL</Label>
                <Input
                  id="edit-url"
                  value={formData.profile_url}
                  onChange={(e) => setFormData({...formData, profile_url: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({...formData, category_id: val})}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cooldown">Global Cooldown (hours)</Label>
                <Input
                  id="edit-cooldown"
                  type="number"
                  value={formData.cooldown_hours}
                  onChange={(e) => setFormData({...formData, cooldown_hours: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateProfile}>Update</Button>
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
                <TableHead>Profile Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Cooldown</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reviewed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                          <p className="text-xs text-muted-foreground">{profile.id.slice(0, 8)}</p>
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
                      {profile.job_categories?.name ? (
                        <Badge variant="secondary">{profile.job_categories.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Clock className="h-3 w-3" />
                        {profile.cooldown_hours}h
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {profile.is_active ? (
                        <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-muted text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {profile.last_reviewed_at 
                        ? new Date(profile.last_reviewed_at).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(profile);
                            setFormData({
                              name: profile.name,
                              profile_url: profile.profile_url,
                              category_id: profile.category_id || "",
                              cooldown_hours: profile.cooldown_hours.toString()
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
                          {profile.is_active ? 'Pause' : 'Activate'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
