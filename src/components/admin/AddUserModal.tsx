import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function AddUserModal({ open, onOpenChange, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update profile with additional data
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            phone: formData.phone,
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }
      }

      toast.success("User added successfully!");
      onUserAdded();
      onOpenChange(false);
      setFormData({ name: "", email: "", phone: "", password: "" });
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Create a password"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} disabled={loading}>
            {loading ? "Adding..." : "Add User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
