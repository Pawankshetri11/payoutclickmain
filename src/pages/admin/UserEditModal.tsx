import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Mail, Phone, Shield, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onUserUpdate?: () => void;
}

export function UserEditModal({ open, onOpenChange, user, onUserUpdate }: UserEditModalProps) {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    kyc: "",
    balance: "",
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "",
        kyc: user.kyc || "",
        balance: user.balance || "",
      });
    }
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          status: editForm.status as 'active' | 'pending' | 'suspended',
          kyc_status: editForm.kyc as 'pending' | 'verified' | 'rejected',
          balance: parseFloat(editForm.balance) || 0,
        })
        .eq('user_id', user.user_id);

      if (error) throw error;
      
      toast.success("User updated successfully!");
      if (onUserUpdate) {
        onUserUpdate();
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "banned":
        return <Badge variant="destructive">Banned</Badge>;
      case "email_unverified":
        return <Badge variant="outline" className="border-warning text-warning">Email Unverified</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKycBadge = (kyc: string) => {
    switch (kyc) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20">Verified</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      case "unverified":
        return <Badge variant="outline">Unverified</Badge>;
      default:
        return <Badge variant="secondary">{kyc}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User - {user.name}
          </DialogTitle>
          <DialogDescription>
            Update user information and account status
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Account Status</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="email_unverified">Email Unverified</SelectItem>
                  <SelectItem value="mobile_unverified">Mobile Unverified</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                {getStatusBadge(editForm.status)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kyc">KYC Status</Label>
              <Select value={editForm.kyc} onValueChange={(value) => setEditForm({...editForm, kyc: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                {getKycBadge(editForm.kyc)}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance (₹)</Label>
              <Input
                id="balance"
                value={editForm.balance}
                onChange={(e) => setEditForm({...editForm, balance: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
          <h4 className="font-semibold text-foreground mb-3">User Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div>
                <p className="text-muted-foreground">Total Earnings</p>
                <p className="font-medium">{user.totalEarnings}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-muted-foreground">Tasks Completed</p>
                <p className="font-medium">{user.tasksCompleted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" />
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-medium">{user.joined}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-warning" />
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="font-medium">{user.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}