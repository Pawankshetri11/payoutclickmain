import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gift,
  Copy,
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { useReferral } from "@/hooks/useReferral";
import { toast } from "sonner";
import { ReferralEarningsModal } from "@/components/user/ReferralEarningsModal";

export default function Referrals() {
  const {
    referralCode,
    referralStats,
    referredUsers,
    referrerInfo,
    loading,
    applyReferralCode,
  } = useReferral();
  
  const [newReferralCode, setNewReferralCode] = useState("");
  const [showApplyCode, setShowApplyCode] = useState(false);
  const [earningsModalOpen, setEarningsModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const copyReferralCode = async () => {
    if (!referralCode) {
      toast.error("Referral code not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success("Referral code copied to clipboard!");
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Referral code copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy referral code");
      }
      document.body.removeChild(textArea);
    }
  };

  const shareReferralCode = async () => {
    if (!referralCode) {
      toast.error("Referral code not available");
      return;
    }
    
    const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    const text = `Join me on this amazing platform and start earning! Use my referral code: ${referralCode}\n\nSign up here: ${referralUrl}`;
    
    try {
      // Check if Web Share API is available (mostly on mobile)
      if (navigator.share) {
        await navigator.share({
          title: 'Join and Earn!',
          text: text,
          url: referralUrl,
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        toast.success("Referral link copied to clipboard!");
      }
    } catch (error) {
      // Final fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("Referral link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to share referral code");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleApplyCode = async () => {
    if (!newReferralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    const success = await applyReferralCode(newReferralCode);
    if (success) {
      setNewReferralCode("");
      setShowApplyCode(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 max-w-6xl">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Gift className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              Refer & Earn
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Invite friends and earn commission on their withdrawals
            </p>
          </div>
          {!referrerInfo && (
            <Dialog open={showApplyCode} onOpenChange={setShowApplyCode}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 text-sm md:text-base w-full md:w-auto">
                  <Gift className="h-4 w-4 mr-2" />
                  Apply Referral Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply Referral Code</DialogTitle>
                  <DialogDescription>
                    Enter a referral code to link your account with a referrer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralCode">Referral Code</Label>
                    <Input
                      id="referralCode"
                      placeholder="Enter referral code (e.g., REF12345678)"
                      value={newReferralCode}
                      maxLength={11}
                      onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowApplyCode(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyCode}>
                    Apply Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Referred By Section */}
      {referrerInfo && (
        <Card className="bg-gradient-card border-border/50 shadow-elegant mb-6 md:mb-8">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">You were referred by</p>
                <p className="text-lg font-bold text-foreground">{referrerInfo.name}</p>
                <p className="text-xs text-muted-foreground">{referrerInfo.email}</p>
                <p className="text-xs text-primary font-mono mt-1">Code: {referrerInfo.referralCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-lg md:text-xl font-bold text-primary">{referralStats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground hidden md:block">{referralStats.activeReferrals} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-success" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Earned</p>
                <p className="text-lg md:text-xl font-bold text-success">₹{referralStats.totalCommissionEarned}</p>
                <p className="text-xs text-muted-foreground hidden md:block">From referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-xl font-bold text-warning">₹{referralStats.pendingCommission}</p>
                <p className="text-xs text-muted-foreground hidden md:block">Next payout</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col gap-2">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-accent" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Avg. Comm.</p>
                <p className="text-lg md:text-xl font-bold text-accent">
                  ₹{referralStats.totalReferrals > 0 ? (referralStats.totalCommissionEarned / referralStats.totalReferrals).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-muted-foreground hidden md:block">Per referral</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant mb-6 md:mb-8">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn 10% commission on their withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex-1">
              <Label htmlFor="code" className="text-xs md:text-sm font-medium">Your Referral Code</Label>
              <div className="text-xl md:text-2xl font-bold text-primary mt-1 font-mono tracking-wider">
                {referralCode || 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code during signup
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={copyReferralCode} variant="outline" size="sm" className="flex-1 md:flex-none">
                <Copy className="h-4 w-4 md:mr-2" />
                <span className="md:inline">Copy</span>
              </Button>
              <Button onClick={shareReferralCode} variant="outline" size="sm" className="flex-1 md:flex-none">
                <Share2 className="h-4 w-4 md:mr-2" />
                <span className="md:inline">Share</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary mb-2">How it works:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Share your referral code with friends</li>
              <li>• When they sign up and start earning, you get connected</li>
              <li>• Earn 10% commission on every withdrawal they make</li>
              <li>• Commission is automatically added to your balance</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referred Users */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Your Referrals</CardTitle>
          <CardDescription className="text-sm">Track the performance of users you've referred</CardDescription>
        </CardHeader>
        <CardContent>
          {referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">User</TableHead>
                    <TableHead className="text-xs md:text-sm">Status</TableHead>
                    <TableHead className="text-xs md:text-sm hidden md:table-cell">Join Date</TableHead>
                    <TableHead className="text-xs md:text-sm">Commission Earned</TableHead>
                    <TableHead className="text-xs md:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/50">
                      <TableCell className="text-xs md:text-sm">
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm">
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-muted-foreground hidden md:table-cell">
                        {user.joinDate}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm font-bold text-success">
                        ₹{user.commissionEarned || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReferral(user);
                            setEarningsModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No referrals yet</h3>
              <p className="text-muted-foreground mb-4">
                Start sharing your referral code to earn commissions!
              </p>
              <Button onClick={shareReferralCode} className="bg-gradient-primary hover:opacity-90">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Earnings History Modal */}
      {selectedReferral && (
        <ReferralEarningsModal
          open={earningsModalOpen}
          onOpenChange={setEarningsModalOpen}
          referredUserId={selectedReferral.referred_id}
          referredUserName={selectedReferral.name}
          referredUserEmail={selectedReferral.email}
        />
      )}
    </div>
  );
}