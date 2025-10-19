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
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReferralEarningsModal } from "@/components/user/ReferralEarningsModal";

const ReferralSystem = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [settings, setSettings] = useState({
    referralCommissionRate: 10,
    companyCommissionRate: 10,
    enabled: true,
  });
  const [referrals, setReferrals] = useState([]);
  const [groupedReferrals, setGroupedReferrals] = useState<any[]>([]);
  const [expandedReferrers, setExpandedReferrers] = useState<Set<string>>(new Set());
  // Removed global commission list; use per-user modal instead
  const [loading, setLoading] = useState(true);
  const [earningsModalOpen, setEarningsModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalCommissions: 0,
    companyRevenue: 0,
  });

  useEffect(() => {
    fetchReferralData();
  }, []);

  // Realtime updates for admin view
  useEffect(() => {
    const channel = (supabase as any)
      .channel('admin-referral-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchReferralData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, fetchReferralData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, fetchReferralData)
      .subscribe();
    return () => {
      (supabase as any).removeChannel(channel);
    };
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching referral data (database-first)...');
      
      // Get all referral relationships from profiles.referred_by
      const { data: allProfiles, error: profilesError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .not('referred_by', 'is', null);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
      }

      console.log('📊 Profiles with referred_by:', allProfiles);

      // Get all user IDs involved
      const allUserIds = new Set<string>();
      (allProfiles || []).forEach((p: any) => {
        allUserIds.add(p.user_id);
        if (p.referred_by) allUserIds.add(p.referred_by);
      });

      // Get all profiles for mapping
      const { data: allUserProfiles } = await supabase
        .from('profiles')
        .select('user_id, name, email, created_at, total_earnings, status')
        .in('user_id', Array.from(allUserIds));

      const profileMap = new Map((allUserProfiles || []).map((p: any) => [p.user_id, p]));

      // Get withdrawal counts
      const { data: allWithdrawals } = await (supabase as any)
        .from('withdrawals')
        .select('user_id, status')
        .in('status', ['approved', 'pending', 'completed']);

      const withdrawalCountMap = new Map<string, number>();
      (allWithdrawals || []).forEach((w: any) => {
        const count = withdrawalCountMap.get(w.user_id) || 0;
        withdrawalCountMap.set(w.user_id, count + 1);
      });

      // Build referral relationships
      const referralRelationships = await Promise.all(
        (allProfiles || []).map(async (profile: any) => {
          const referredBy = profile.referred_by;
          const referrerProfile = profileMap.get(referredBy);
          
          // Get withdrawal count for this referred user
          const withdrawalCount = withdrawalCountMap.get(profile.user_id) || 0;

          // Get actual commission earned by referrer from this referee
          const { data: commissions } = await (supabase as any)
            .from('transactions')
            .select('amount, description')
            .eq('user_id', referredBy)
            .eq('type', 'earning')
            .ilike('description', `%${profile.email}%`);
          
          const totalCommission = (commissions || []).reduce((sum: number, c: any) => sum + c.amount, 0);
          
          return {
            id: profile.user_id,
            referrer: referrerProfile?.name || 'Unknown',
            referrerEmail: referrerProfile?.email || '',
            referrerId: referredBy,
            referee: profile.name || 'Unknown',
            refereeEmail: profile.email || '',
            refereeId: profile.user_id,
            status: profile.status || 'active',
            joinDate: new Date(profile.created_at).toLocaleDateString(),
            totalEarnings: profile.total_earnings || 0,
            commissionEarned: totalCommission,
            withdrawals: withdrawalCount
          };
        })
      );

      setReferrals(referralRelationships);

      // Group referrals by referrer
      const grouped = referralRelationships.reduce((acc: any, curr: any) => {
        const existingReferrer = acc.find((r: any) => r.referrerId === curr.referrerId);
        if (existingReferrer) {
          existingReferrer.referees.push(curr);
          existingReferrer.totalCommission += curr.commissionEarned || 0;
          existingReferrer.totalWithdrawals += curr.withdrawals || 0;
        } else {
          acc.push({
            referrerId: curr.referrerId,
            referrer: curr.referrer,
            referrerEmail: curr.referrerEmail,
            referees: [curr],
            totalCommission: curr.commissionEarned || 0,
            totalWithdrawals: curr.withdrawals || 0
          });
        }
        return acc;
      }, []);

      setGroupedReferrals(grouped);

      // Calculate stats from transactions
      const { data: commissionTxns } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'earning')
        .ilike('description', '%referral commission%');

      const totalCommissions = (commissionTxns || []).reduce((sum: number, r: any) => sum + (r.amount || 0), 0);

      setStats({
        totalReferrals: referralRelationships.length,
        activeReferrals: referralRelationships.filter((r: any) => r.status === 'active').length,
        totalCommissions,
        companyRevenue: totalCommissions,
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
        <div className="flex gap-2">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-xl font-bold text-primary">{stats.totalReferrals}</p>
                <p className="text-xs text-muted-foreground">{stats.activeReferrals} active</p>
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
                <p className="text-xs text-muted-foreground">
                  {stats.totalReferrals > 0 ? Math.round((stats.activeReferrals / stats.totalReferrals) * 100) : 0}% active
                </p>
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
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="referrals">Referral Relationships</TabsTrigger>
            </TabsList>

            <TabsContent value="referrals" className="space-y-4">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : groupedReferrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referral relationships found
                  </div>
                ) : (
                  groupedReferrals
                    .filter((group: any) => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return (
                        group.referrer?.toLowerCase().includes(q) ||
                        group.referrerEmail?.toLowerCase().includes(q) ||
                        group.referees.some((ref: any) => 
                          ref.referee?.toLowerCase().includes(q) ||
                          ref.refereeEmail?.toLowerCase().includes(q)
                        )
                      );
                    })
                    .map((group: any) => {
                      const isExpanded = expandedReferrers.has(group.referrerId);
                      return (
                        <Card key={group.referrerId} className="border border-border/50">
                          <CardHeader 
                            className="cursor-pointer hover:bg-accent/20 transition-colors"
                            onClick={() => {
                              const newExpanded = new Set(expandedReferrers);
                              if (isExpanded) {
                                newExpanded.delete(group.referrerId);
                              } else {
                                newExpanded.add(group.referrerId);
                              }
                              setExpandedReferrers(newExpanded);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold text-lg text-foreground">{group.referrer}</p>
                                  <p className="text-sm text-muted-foreground">{group.referrerEmail}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                                  <p className="text-lg font-bold text-primary">{group.referees.length}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total Commission</p>
                                  <p className="text-lg font-bold text-success">₹{group.totalCommission}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Total Withdrawals</p>
                                  <p className="text-lg font-bold text-foreground">{group.totalWithdrawals}</p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  {isExpanded ? '▼' : '▶'}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {isExpanded && (
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Referee</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Join Date</TableHead>
                                    <TableHead>
                                      <div className="flex items-center gap-1">
                                        Commission Earned
                                        <span className="text-muted-foreground text-xs" title="Commission earned by referrer from this referee's withdrawals (10%)">ⓘ</span>
                                      </div>
                                    </TableHead>
                                    <TableHead>Withdrawals</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.referees.map((referral: any) => (
                                    <TableRow key={referral.id} className="hover:bg-accent/50">
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
                                      <TableCell className="font-medium text-success">
                                        ₹{referral.commissionEarned || 0}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {referral.withdrawals || 0}
                                      </TableCell>
                                      <TableCell>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => {
                                            setSelectedReferral({
                                              referred_id: referral.refereeId,
                                              name: referral.referee,
                                              email: referral.refereeEmail
                                            });
                                            setEarningsModalOpen(true);
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })
                )}
              </div>
            </TabsContent>
          </Tabs>
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
};

export default ReferralSystem;