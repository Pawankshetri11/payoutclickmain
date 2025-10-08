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
import { User, Mail, Phone, Shield, DollarSign, Calendar, Plus, Minus } from "lucide-react";
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

  const [adjustAmount, setAdjustAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBalanceSection, setShowBalanceSection] = useState(false);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "",
        kyc: user.kyc_status || "",
        balance: user.balance?.toString() || "0",
      });
    }
  }, [user]);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          status: editForm.status as "active" | "pending" | "suspended",
          kyc_status: editForm.kyc as "pending" | "verified" | "rejected",
          balance: parseFloat(editForm.balance) || 0,
        })
        .eq("user_id", user.user_id);

      if (error) throw error;

      toast.success("User updated successfully!");
      onUserUpdate?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceChange = async (type: "add" | "remove") => {
    const amount = parseFloat(adjustAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const currentBalance = parseFloat(editForm.balance) || 0;
      const newBalance =
        type === "add"
          ? currentBalance + amount
          : Math.max(0, currentBalance - amount);

      const { error } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("user_id", user.user_id);

      if (error) throw error;

      setEditForm({ ...editForm, balance: newBalance.toString() });
      setAdjustAmount("");

      toast.success(
        `₹${amount} ${type === "add" ? "added to" : "removed from"} balance`
      );
    } catch (error: any) {
      console.error("Error updating balance:", error);
      toast.error("Failed to update balance");
    } finally {
      setLoading(false);
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
          <DialogDescription>Update user information and manage balance</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Basic Information</h3>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Account Status & Balance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Account Status</h3>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="email_unverified">Email Unverified</SelectItem>
                  <SelectItem value="mobile_unverified">Mobile Unverified</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">{getStatusBadge(editForm.status)}</div>
            </div>

            <div className="space-y-2">
              <Label>KYC Status</Label>
              <Select
                value={editForm.kyc}
                onValueChange={(value) => setEditForm({ ...editForm, kyc: value })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">{getKycBadge(editForm.kyc)}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Account Balance</Label>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowBalanceSection(!showBalanceSection)}
                >
                  {showBalanceSection ? 'Hide' : 'Adjust'} Balance
                </Button>
              </div>
              <div className="text-2xl font-bold text-foreground">₹{editForm.balance}</div>
              
              {showBalanceSection && (
                <div className="space-y-3 p-4 bg-accent/20 rounded-lg mt-3">
                  <Label htmlFor="adjustAmount">Adjust Balance Amount (₹)</Label>
                  <Input
                    id="adjustAmount"
                    placeholder="Enter amount"
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => handleBalanceChange("add")}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Balance
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleBalanceChange("remove")}
                      disabled={loading}
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Remove from Balance
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
