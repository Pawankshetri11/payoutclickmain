import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  TrendingUp,
  DollarSign,
  Settings,
  Eye,
  Gift,
  Percent,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ReferralSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState({
    referralCommissionRate: 10,
    companyCommissionRate: 10,
    enabled: true,
  });
  const [referrals, setReferrals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    companyRevenue: 0,
  });

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      // Referral system would query from referrals table when implemented
      setReferrals([]);
      setCommissions([]);
      setStats({
        totalReferrals: 0,
        activeReferrals: 0,
        totalCommissions: 0,
        companyRevenue: 0,
      });
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async () => {
    try {
      // In a real app, this would update the database
      toast.success("Referral settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "paid":
        return <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Referral System
          </h1>
          <p className="text-muted-foreground">Manage refer & earn program and commission tracking</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Referral System Settings</DialogTitle>
              <DialogDescription>
                Configure commission rates and system settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="referralRate">Referral Commission Rate (%)</Label>
                <Input
                  id="referralRate"
                  type="number"
                  value={settings.referralCommissionRate}
                  onChange={(e) => setSettings({...settings, referralCommissionRate: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Percentage paid to referrer on each withdrawal
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyRate">Company Commission Rate (%)</Label>
                <Input
                  id="companyRate"
                  type="number"
                  value={settings.companyCommissionRate}
                  onChange={(e) => setSettings({...settings, companyCommissionRate: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Company withdrawal processing fee
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="enabled">Enable Referral System</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={updateSettings}>
                Update Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-xl font-bold text-primary">{stats.totalReferrals}</p>
                <p className="text-xs text-success">No referrals yet</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Active Referrals</p>
                <p className="text-xl font-bold text-success">{stats.activeReferrals}</p>
                <p className="text-xs text-muted-foreground">0% conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Total Commissions</p>
                <p className="text-xl font-bold text-warning">₹{stats.totalCommissions}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Company Revenue</p>
                <p className="text-xl font-bold text-accent">₹{stats.companyRevenue}</p>
                <p className="text-xs text-muted-foreground">From withdrawals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Referral Management</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search referrals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 bg-background/50 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="referrals" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="referrals">Referral Relationships</TabsTrigger>
              <TabsTrigger value="commissions">Commission History</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Commission Earned</TableHead>
                    <TableHead>Withdrawals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : referrals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No referral relationships found
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((referral: any) => (
                      <TableRow key={referral.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{referral.referrer}</p>
                          <p className="text-sm text-muted-foreground">{referral.referrerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{referral.referee}</p>
                          <p className="text-sm text-muted-foreground">{referral.refereeEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(referral.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {referral.joinDate}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        ₹{referral.totalEarnings}
                      </TableCell>
                      <TableCell className="font-medium text-success">
                        ₹{referral.commissionEarned}
                      </TableCell>
                      <TableCell className="text-center">
                        {referral.withdrawals}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="commissions" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referee</TableHead>
                    <TableHead>Withdrawal Amount</TableHead>
                    <TableHead>Commission (10%)</TableHead>
                    <TableHead>Company Fee (10%)</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : commissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No commission history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissions.map((commission: any) => (
                      <TableRow key={commission.id} className="hover:bg-accent/50">
                      <TableCell className="font-medium text-foreground">
                        {commission.referrer}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {commission.referee}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        ₹{commission.withdrawalAmount}
                      </TableCell>
                      <TableCell className="font-medium text-success">
                        ₹{commission.commissionAmount}
                      </TableCell>
                      <TableCell className="font-medium text-warning">
                        ₹{commission.companyFee}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {commission.date}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(commission.status)}
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSystem;