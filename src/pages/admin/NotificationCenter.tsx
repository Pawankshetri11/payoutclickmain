import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Send, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useEmailSystem } from '@/hooks/useEmailSystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  status: string;
}

export default function NotificationCenter() {
  const { sendManualEmail, getEmailLogs, loading } = useEmailSystem();
  const [users, setUsers] = useState<User[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [notificationType, setNotificationType] = useState<'withdrawal' | 'welcome' | 'earning'>('welcome');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchEmailLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, name, status');

      if (error) throw error;
      const usersWithId = (data || []).map(user => ({
        id: user.user_id,
        email: user.email,
        name: user.name,
        status: user.status
      }));
      setUsers(usersWithId);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const logs = await getEmailLogs();
      setEmailLogs(logs);
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }

    let subject = '';
    let content = '';

    switch (notificationType) {
      case 'welcome':
        subject = 'Welcome to PayoutClick!';
        content = `
          <h2 style="color: #3b82f6;">Welcome to PayoutClick!</h2>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>You can now start completing tasks and earning money.</p>
          <p>Get started by browsing available tasks in your dashboard.</p>
        `;
        break;
      case 'withdrawal':
        subject = 'Withdrawal Processed Successfully';
        content = `
          <h2 style="color: #10b981;">Withdrawal Completed!</h2>
          <p>Your withdrawal request has been processed successfully.</p>
          <p>The funds should arrive in your account within 1-3 business days.</p>
          <p>Thank you for using PayoutClick!</p>
        `;
        break;
      case 'earning':
        subject = 'Earnings Credited to Your Balance';
        content = `
          <h2 style="color: #f59e0b;">New Earnings Added!</h2>
          <p>Great news! Your earnings have been credited to your account balance.</p>
          <p>You can view your updated balance in your dashboard.</p>
          <p>Keep up the great work!</p>
        `;
        break;
    }

    try {
      await sendManualEmail({
        recipients: [recipientEmail],
        subject,
        content
      });
      
      setRecipientEmail('');
      fetchEmailLogs();
    } catch (error) {
      // Error already handled in useEmailSystem
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Notification Center
          </h1>
          <p className="text-muted-foreground">Send automated notifications to users</p>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Notification
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notification Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Send Notification
              </CardTitle>
              <CardDescription>
                Send automated notifications for key events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select value={notificationType} onValueChange={(value: any) => setNotificationType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Mail (Account Created)</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal Completed</SelectItem>
                    <SelectItem value="earning">Earning Credited to Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="recipient">Recipient Email</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSendNotification} 
                  disabled={loading}
                  className="flex items-center gap-2 w-full"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Notification'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Automated Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Welcome Mail</p>
                  <p className="text-muted-foreground">Sent when a new user creates an account</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Withdrawal Completed</p>
                  <p className="text-muted-foreground">Sent when admin approves a withdrawal request</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Earning Credited</p>
                  <p className="text-muted-foreground">Sent when earnings are added to user balance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notification Logs
              </CardTitle>
              <CardDescription>
                View recent notification history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.recipient}</TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
