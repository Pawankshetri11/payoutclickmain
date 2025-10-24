import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Settings as SettingsCog,
  Server,
  Database,
  Globe,
  Shield,
  Bell,
  Mail,
  Zap,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";

const Settings = () => {
  const { settings: systemSettings, loading: systemLoading, updateSetting, getSetting } = useSystemSettings();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [timezone, setTimezone] = useState("");

// Load system settings
useEffect(() => {
  if (systemSettings && Object.keys(systemSettings).length > 0) {
    setEmailNotifications(getSetting('email_notifications', true));
    setMaintenanceMode(getSetting('maintenance_mode', false));
    setAutoBackup(getSetting('auto_backup', true));
    setIpRestriction(getSetting('ip_restriction', false));
    setSiteName(getSetting('site_name', 'PayoutClick'));
    setSiteDescription(getSetting('site_description', 'Complete payout management system'));
    setAdminEmail(getSetting('admin_email', ''));
    setTimezone(getSetting('timezone', 'UTC'));
  }
}, [systemSettings]);

const handleSaveAllSettings = async () => {
  try {
    await Promise.all([
      updateSetting('email_notifications', emailNotifications),
      updateSetting('maintenance_mode', maintenanceMode),
      updateSetting('auto_backup', autoBackup),
      updateSetting('ip_restriction', ipRestriction),
      updateSetting('site_name', siteName),
      updateSetting('site_description', siteDescription),
      updateSetting('admin_email', adminEmail),
      updateSetting('timezone', timezone),
    ]);
    toast.success('All settings saved successfully');
  } catch (error) {
    toast.error('Failed to save some settings');
  }
};

const handleClearCache = (cacheType: string) => {
  toast.success(`${cacheType} cache cleared successfully`);
};

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsCog className="h-8 w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-warning/20 text-warning hover:bg-warning/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90 shadow-glow"
            onClick={handleSaveAllSettings}
            disabled={systemLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Server Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Badge className="bg-success/10 text-success border-success/20">Online</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <Badge variant="outline" className="border-warning text-warning">High Load</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-info" />
              <div>
                <p className="text-sm text-muted-foreground">Security</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Badge className="bg-success/10 text-success border-success/20">Secure</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 shadow-elegant">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Performance</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Badge className="bg-info/10 text-info border-info/20">Optimal</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-gradient-card border-border/50 shadow-elegant">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    General Settings
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input 
                      id="site-name" 
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea 
                      id="site-description" 
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input 
                      id="admin-email" 
                      type="email" 
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input 
                      id="timezone" 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>

                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive system notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Enable maintenance mode for updates</p>
                    </div>
                    <Switch
                      id="maintenance-mode"
                      checked={maintenanceMode}
                      onCheckedChange={setMaintenanceMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-backup">Auto Backup</Label>
                      <p className="text-sm text-muted-foreground">Automatically backup system data</p>
                    </div>
                    <Switch
                      id="auto-backup"
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="ip-restriction">IP Restriction</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Restrict admin access to specific IP addresses
                      </p>
                    </div>
                    <Switch
                      id="ip-restriction"
                      checked={ipRestriction}
                      onCheckedChange={setIpRestriction}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Auto-logout after 30 minutes of inactivity
                      </p>
                    </div>
                    <Switch id="session-timeout" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="password-policy">Strong Password Policy</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Require complex passwords with special characters
                      </p>
                    </div>
                    <Switch id="password-policy" defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="dates" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Payment Date Configuration
                </h3>
                
                <div className="p-4 border border-info/20 bg-info/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-info mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-info mb-2">Configure when users can see earnings and request withdrawals</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Earnings visible dates: When users can view their task earnings</li>
                        <li>Withdrawal request dates: When users can submit withdrawal requests</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Earnings Visibility</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="earnings-start-day">Start Date (Day of Month)</Label>
                        <Input 
                          id="earnings-start-day" 
                          type="number" 
                          min="1" 
                          max="31" 
                          defaultValue="1"
                          placeholder="1"
                        />
                        <p className="text-xs text-muted-foreground">Day when earnings become visible</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="earnings-end-day">End Date (Day of Month)</Label>
                        <Input 
                          id="earnings-end-day" 
                          type="number" 
                          min="1" 
                          max="31" 
                          defaultValue="5"
                          placeholder="5"
                        />
                        <p className="text-xs text-muted-foreground">Last day earnings are visible</p>
                      </div>

                      <div className="p-3 bg-muted/20 rounded border border-border/50">
                        <p className="text-sm font-medium">Current: Days 1-5</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Users can view their earnings from the 1st to 5th of each month
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Withdrawal Window</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawal-start-day">Start Date (Day of Month)</Label>
                        <Input 
                          id="withdrawal-start-day" 
                          type="number" 
                          min="1" 
                          max="31" 
                          defaultValue="26"
                          placeholder="26"
                        />
                        <p className="text-xs text-muted-foreground">Day when withdrawals open</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="withdrawal-end-day">End Date (Day of Month)</Label>
                        <Input 
                          id="withdrawal-end-day" 
                          type="number" 
                          min="1" 
                          max="31" 
                          defaultValue="31"
                          placeholder="31"
                        />
                        <p className="text-xs text-muted-foreground">Last day to request withdrawal</p>
                      </div>

                      <div className="p-3 bg-muted/20 rounded border border-border/50">
                        <p className="text-sm font-medium">Current: Days 26-31</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Users can request withdrawals from the 26th to 31st of each month
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Dates
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Software Updates
                </h3>
                
                <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <h4 className="font-medium text-success">System Up to Date</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current version: 2.1.4 - Last updated: January 10, 2024
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Updates</Label>
                      <p className="text-sm text-muted-foreground">Automatically install security updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Beta Updates</Label>
                      <p className="text-sm text-muted-foreground">Receive beta version updates</p>
                    </div>
                    <Switch />
                  </div>

                  <Button className="bg-gradient-primary hover:opacity-90">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check for Updates
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;