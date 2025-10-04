import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOAuthSettings } from "@/hooks/useOAuthSettings";
import {
  Settings as SettingsIcon,
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
  Key,
} from "lucide-react";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);
  
  const { settings: oauthSettings, loading: oauthLoading, updateSettings } = useOAuthSettings();
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleClientSecret, setGoogleClientSecret] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);

  // Update local state when OAuth settings load
  useEffect(() => {
    if (oauthSettings) {
      setGoogleClientId(oauthSettings.client_id || "");
      setGoogleClientSecret(oauthSettings.client_secret || "");
      setGoogleEnabled(oauthSettings.enabled);
    }
  }, [oauthSettings]);

  const handleSaveOAuth = async () => {
    await updateSettings({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      enabled: googleEnabled,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-warning/20 text-warning hover:bg-warning/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="cache">Cache</TabsTrigger>
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
                    <Input id="site-name" defaultValue="PayoutClick" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea id="site-description" defaultValue="Complete payout management system" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" type="email" defaultValue="admin@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="UTC" />
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

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ip-restriction">IP-Based Account Restriction</Label>
                      <p className="text-sm text-muted-foreground">Only allow one account per IP address</p>
                    </div>
                    <Switch
                      id="ip-restriction"
                      checked={ipRestriction}
                      onCheckedChange={setIpRestriction}
                    />
                  </div>

                  {ipRestriction && (
                    <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <h4 className="font-medium text-warning">IP Restriction Enabled</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Users will only be able to create one account per IP address. This helps prevent multiple account abuse.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                      <Label htmlFor="ip-restriction">IP-Based Account Restriction</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Only allow one account per IP address to prevent abuse
                      </p>
                    </div>
                    <Switch
                      id="ip-restriction"
                      checked={ipRestriction}
                      onCheckedChange={setIpRestriction}
                    />
                  </div>

                  {ipRestriction && (
                    <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <div>
                          <h4 className="font-medium text-warning">IP Restriction Enabled</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Users will only be able to create one account per IP address. This helps prevent multiple account abuse and fraud.
                          </p>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <li>• Tracks IP addresses during signup</li>
                            <li>• Blocks duplicate account creation attempts</li>
                            <li>• Logs suspicious activity</li>
                            <li>• Can be bypassed by admins for legitimate cases</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="login-attempts">Limit Login Attempts</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Block accounts after 5 failed login attempts
                      </p>
                    </div>
                    <Switch id="login-attempts" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="session-security">Enhanced Session Security</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Terminate sessions on password change
                      </p>
                    </div>
                    <Switch id="session-security" defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="oauth" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Google OAuth Configuration
                </h3>
                
                <div className="p-4 border border-info/20 bg-info/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-info mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-info mb-2">Setup Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to Google Cloud Console and create a new project</li>
                        <li>Enable Google+ API</li>
                        <li>Create OAuth 2.0 credentials (Web application)</li>
                        <li>Add authorized redirect URI: <code className="bg-background/50 px-1 rounded">{window.location.origin}/</code></li>
                        <li>Copy the Client ID and Client Secret below</li>
                        <li>Configure redirect URL in Supabase Authentication settings</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <Label htmlFor="google-oauth-enabled">Enable Google Login</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow users to sign in with their Google account
                      </p>
                    </div>
                    <Switch
                      id="google-oauth-enabled"
                      checked={googleEnabled}
                      onCheckedChange={setGoogleEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-client-id">Google Client ID</Label>
                    <Input
                      id="google-client-id"
                      placeholder="Enter your Google OAuth Client ID"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      disabled={oauthLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-client-secret">Google Client Secret</Label>
                    <Input
                      id="google-client-secret"
                      type="password"
                      placeholder="Enter your Google OAuth Client Secret"
                      value={googleClientSecret}
                      onChange={(e) => setGoogleClientSecret(e.target.value)}
                      disabled={oauthLoading}
                    />
                  </div>

                  <Button
                    onClick={handleSaveOAuth}
                    disabled={oauthLoading}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save OAuth Settings
                  </Button>

                  {googleEnabled && googleClientId && (
                    <div className="p-4 border border-success/20 bg-success/5 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div>
                          <h4 className="font-medium text-success">Google OAuth Enabled</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Users can now sign up and log in using their Google account.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="application" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-upload">Max Upload Size (MB)</Label>
                    <Input id="max-upload" type="number" defaultValue="10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pagination">Items per Page</Label>
                    <Input id="pagination" type="number" defaultValue="20" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Input id="currency" defaultValue="USD" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="server" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" />
                  Server Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-host">Server Host</Label>
                    <Input id="server-host" defaultValue="localhost" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="server-port">Server Port</Label>
                    <Input id="server-port" type="number" defaultValue="8080" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                    <Input id="memory-limit" type="number" defaultValue="512" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpu-limit">CPU Limit (%)</Label>
                    <Input id="cpu-limit" type="number" defaultValue="80" />
                  </div>
                </div>

                <div className="p-4 border border-info/20 bg-info/5 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Server className="h-5 w-5 text-info mt-0.5" />
                    <div>
                      <h4 className="font-medium text-info">Server Status</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Server is running optimally. Last restart: 2 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cache" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Cache Management
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Application Cache</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Size:</span>
                        <span className="font-medium">245 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Entries:</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Clear Cache
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Database Cache</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Size:</span>
                        <span className="font-medium">89 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Queries:</span>
                        <span className="font-medium">3,456</span>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Clear Cache
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">File Cache</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Size:</span>
                        <span className="font-medium">156 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Files:</span>
                        <span className="font-medium">892</span>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Clear Cache
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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